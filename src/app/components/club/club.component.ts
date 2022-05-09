import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { Club, ClubView } from 'src/app/models/club';
import { Game } from 'src/app/models/game';
import { Player } from 'src/app/models/player';
import { ResultEnum } from 'src/app/models/result.enum';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss'],
})
export class ClubComponent implements OnInit {
  public club$: Observable<ClubView>;

  firstTime: Date;
  downloadRequest: number;
  processRequest: number;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService
  ) {}

  ngOnInit(): void {
    this.club$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.firstTime = new Date();
        return this.databaseService.getClub(+params.get('id'));
      }),
      map((club) => {
        this.downloadRequest = new Date().valueOf() - this.firstTime.valueOf();
        return club;
      }),
      map((club) => this.mapIntoTabs(club)),
      map((club) => this.recalculatePlayerResult(club)),
      map((club) => this.sort(club)),
      map((club) => {
        this.processRequest = new Date().valueOf() - this.firstTime.valueOf();
        return club;
      })
    );
  }

  sort(clubView: ClubView): ClubView {
    clubView.teams.sort((a, b) => a.id - b.id);
    clubView.teams.forEach((team) => team.rounds.sort((a, b) => a.id - b.id));
    clubView.teams.forEach((team) => {
      team.rounds.forEach((round) =>
        round.games.sort((a, b) => a.board - b.board)
      );
      team.players.sort((a, b) => b.numberOfGames - a.numberOfGames);
    });
    return clubView;
  }

  recalculatePlayerResult(clubView: ClubView): ClubView {
    clubView.teams.forEach((team) =>
      team.players.forEach((player) => {
        team.rounds.forEach((round) => {
          const game = round.games.find((game) => game.white.id === player.id);
          if (game) {
            player.numberOfGames++;
            player.score += this.checkWhiteScore(game.result);
          }
        });
        team.rounds.forEach((round) => {
          const game = round.games.find((game) => game.black.id === player.id);
          if (game) {
            player.numberOfGames++;
            player.score += this.checkBlackScore(game.result);
          }
        });
      })
    );
    return clubView;
  }

  checkBlackScore(result: ResultEnum): number {
    switch (result) {
      case ResultEnum.BlackWins:
      case ResultEnum.BlackFF:
        return 1;
      case ResultEnum.Draw:
        return 0.5;
      case ResultEnum.WhiteWins:
      case ResultEnum.WhiteFF:
        return 0;
      default:
        return 0;
    }
  }

  checkWhiteScore(result: ResultEnum): number {
    switch (result) {
      case ResultEnum.WhiteWins:
      case ResultEnum.WhiteFF:
        return 1;
      case ResultEnum.Draw:
        return 0.5;
      case ResultEnum.BlackWins:
      case ResultEnum.BlackFF:
        return 0;
      default:
        return 0;
    }
  }

  mapIntoTabs(club: Club): ClubView {
    const clubView: ClubView = { id: club.id, name: club.name, teams: [] };

    club.players.forEach((player) =>
      player.games.forEach((game) => this.addGame(clubView, game, player))
    );
    return clubView;
  }

  addGame(clubView: ClubView, game: Game, player: Player): void {
    const teamNumber =
      player.id === game.white.id
        ? game.teamWhite.teamNumber
        : game.teamBlack.teamNumber;
    const division = `${game.teamWhite.class}${game.teamWhite.division}`;

    let team = clubView.teams.find((team) => team.id === teamNumber);
    if (!team) {
      team = {
        id: teamNumber,
        clubId: clubView.id,
        clubName: clubView.name,
        division: division,
        rounds: [],
        players: [],
      };
      clubView.teams.push(team);
    }

    let round = team.rounds.find((round) => round.id === game.round);
    if (!round) {
      round = { id: game.round, scoreHome: 0, games: [] };
      team.rounds.push(round);
    }
    round.games.push(game);
    round.scoreHome +=
      game.board % 2 === 1
        ? this.checkWhiteScore(game.result)
        : this.checkBlackScore(game.result);

    if (!team.players.find((playerarr) => playerarr.id === player.id)) {
      const newplayer = { ...player };
      newplayer.numberOfGames = 0;
      newplayer.score = 0;
      team.players.push(newplayer);
    }
  }
}
