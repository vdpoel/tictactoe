/// <reference path="../types/jsdom.d.ts" />

/**
 * Bootstraps a jsdom environment so Angular's TestBed can create and interact
 * with DOM elements when running under Node.js (Cucumber / ts-node).
 *
 * This file must be required before any Angular testing import.
 */

import { JSDOM } from 'jsdom';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
});

const { window } = dom;

// Expose browser globals needed by Angular and the DOM renderer.
(globalThis as Record<string, unknown>)['window'] = window;
(globalThis as Record<string, unknown>)['document'] = window.document;
(globalThis as Record<string, unknown>)['navigator'] = window.navigator;
(globalThis as Record<string, unknown>)['Node'] = window.Node;
(globalThis as Record<string, unknown>)['Element'] = window.Element;
(globalThis as Record<string, unknown>)['HTMLElement'] = window.HTMLElement;
(globalThis as Record<string, unknown>)['Event'] = window.Event;
(globalThis as Record<string, unknown>)['CustomEvent'] = window.CustomEvent;

// Initialise Angular's testing environment once for the whole process.
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    teardown: { destroyAfterEach: true },
});
