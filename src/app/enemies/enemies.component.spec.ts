import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemiesComponent } from './enemies.component';

describe('EnemiesComponent', () => {
  let component: EnemiesComponent;
  let fixture: ComponentFixture<EnemiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnemiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnemiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
