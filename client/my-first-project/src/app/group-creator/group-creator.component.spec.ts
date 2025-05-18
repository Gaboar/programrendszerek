import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCreatorComponent } from './group-creator.component';

describe('GroupCreatorComponent', () => {
  let component: GroupCreatorComponent;
  let fixture: ComponentFixture<GroupCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCreatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
