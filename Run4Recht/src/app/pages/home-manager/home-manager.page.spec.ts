import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeManagerPage } from './home-manager.page';

describe('HomeManagerPage', () => {
  let component: HomeManagerPage;
  let fixture: ComponentFixture<HomeManagerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
