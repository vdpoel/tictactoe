import { Before, After } from '@cucumber/cucumber';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PlayerSetupComponent } from '../../src/app/features/game/player-setup/player-setup.component';
import { ctx } from './world';

Before(async function () {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        imports: [PlayerSetupComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    await TestBed.compileComponents();
    ctx.fixture = TestBed.createComponent(PlayerSetupComponent);
    ctx.httpMock = TestBed.inject(HttpTestingController);
    ctx.lastGameState = null;
    ctx.previousGameState = null;
    ctx.expectedHighlightedCells = [];
    ctx.lastSelectedCellIndex = 0;
    ctx.fixture.detectChanges();
});

After(function () {
    ctx.httpMock?.verify();
});
