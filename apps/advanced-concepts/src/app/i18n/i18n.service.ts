import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import format = require('string-format');
import en from '../../assets/locale/en.json';

type TranslationTree = { [key: string]: string | TranslationTree };

type DotPaths<T> = {
    [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DotPaths<typeof en>;

interface I18nRequestContext {
    tenantId?: string;
    locale: string;
}

@Injectable({ scope: Scope.REQUEST, durable: true })
export class I18nService {
    private readonly logger = new Logger(I18nService.name);
    private readonly defaultLocale = 'en';
    private readonly translations = new Map<string, TranslationTree>();

    constructor(@Inject(REQUEST) private readonly context: I18nRequestContext) {}

    translate(key: TranslationKey, params?: Record<string, unknown>): string {
        const locale = this.context.locale ?? this.defaultLocale;
        const template = this.resolve(this.loadLocale(locale), key)
            ?? this.resolve(this.loadLocale(this.defaultLocale), key)
            ?? key;

        return params ? format(template, params) : template;
    }

    private resolve(tree: TranslationTree, path: string): string | undefined {
        const value = path.split('.').reduce<string | TranslationTree | undefined>(
            (node, segment) => (node && typeof node === 'object' ? node[segment] : undefined),
            tree,
        );

        return typeof value === 'string' ? value : undefined;
    }

    private loadLocale(locale: string): TranslationTree {
        if (!this.translations.has(locale)) {
            const filePath = join(__dirname, 'assets', 'locale', `${locale}.json`);

            try {
                this.translations.set(locale, JSON.parse(readFileSync(filePath, 'utf-8')));
            } catch {
                this.logger.warn(`Missing translation file for locale "${locale}"`);
                this.translations.set(locale, {});
            }
        }

        return this.translations.get(locale)!;
    }
}
