import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RanglistePage } from './rangliste.page';

describe('RanglistePage', () => {
  let component: RanglistePage;
  let fixture: ComponentFixture<RanglistePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RanglistePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
