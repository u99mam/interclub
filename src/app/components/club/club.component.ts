import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  pipe,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ClubView } from 'src/app/models/club';
import { Game } from 'src/app/models/game';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';
import { TeamServiceService } from 'src/app/services/team-service.service';
import { PlayerListComponent } from '../team-components/player-list/player-list.component';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss'],
})
export class ClubComponent implements OnInit {
  public club$: Observable<ClubView>;
  public activeLink: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService,
    private router: Router,
    private teamService: TeamServiceService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activeLink = this.teamService.selectedTeamTab
      .asObservable()
      .pipe(tap(() => this.cd.detectChanges()));
    this.club$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.databaseService.getClub(+params.get('id'));
      }),
      filter((club) => {
        if (!club) this.router.navigate(['404']);
        return !!club;
      })
    );
  }
}
