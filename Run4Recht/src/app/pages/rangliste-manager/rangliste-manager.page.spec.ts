import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RanglisteManagerPage } from './rangliste-manager.page';

describe('RanglisteManagerPage', () => {
  let component: RanglisteManagerPage;
  let fixture: ComponentFixture<RanglisteManagerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RanglisteManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
