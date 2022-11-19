import { Component, Inject, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'vc-markdown',
    template: '<pre *ngIf="source" class="markdown" [innerHTML]="mdHtml"></pre>'
})
export class MarkdownComponent implements OnChanges {
    @Input() source: string;
    @Input() objectIds: any;
    @Input() ctfData: any;
    @Input() repoType: string;
    mdHtml: SafeHtml;

    constructor(private sanitizer: DomSanitizer,
                @Inject('vcUtil') private vcUtil,
                @Inject('ctfService') private ctfService,
                @Inject('markdownService') private markdownService) {
        if (this.objectIds) {
            let customObjectIdMappings;
            if (this.ctfData) {
                customObjectIdMappings =
                    this.ctfService.getCustomObjectIdMappings(this.ctfData);
            }
            this.markdownService.registerMarkupFunction(this.markupHtmlObjectIds,
                customObjectIdMappings);
        }
        if (this.repoType === 'git') {
            this.markdownService.registerMarkupFunction(this.vcUtil.markupHtmlGitRefs);
        } else if (this.repoType === 'svn') {
            this.markdownService.registerMarkupFunction(this.vcUtil.markupHtmlSvnRefs);
        }
    }

    ngOnChanges(changesObj) {
        if (changesObj.source &&
            (changesObj.source.currentValue !== changesObj.source.previousValue)) {
            this.mdHtml = this.md2html(this.source);
        }
    }

    private markupHtmlObjectIds(element) {
        return this.vcUtil.markupHtmlObjectIds(element, this.ctfData);
    }

    private md2html(s) {
        try {
            return this.sanitizer.bypassSecurityTrustHtml(
                this.markdownService.makeHtml(s));
        } catch (error) {
            console.log('Unable to generate safe HTML from Markdown content.', error);
        }
    }
}
