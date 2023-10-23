import { Pipe, PipeTransform } from '@angular/core';
import { ColorEnum } from 'shared/models/ColorEnum';
import { OwnGame } from 'shared/models/OwnGame';
import { Game } from 'shared/models/Game';

@Pipe({
  name: 'ownGame',
})
export class OwnGamePipe implements PipeTransform {
  transform(value: Game[], id: number): OwnGame[] {
    const result: OwnGame[] = [];
    value.forEach((game) => {
      const color = game.white.id === id ? ColorEnum.Wit : ColorEnum.Zwart;

      const newGame: OwnGame = {
        opponent: color === ColorEnum.Wit ? game.black : game.white,
        color: color,
        result: game.result,
        board: game.board,
        round: game.round,
        opponentTeam: color === ColorEnum.Wit ? game.teamBlack : game.teamWhite,
      };
      result.push(newGame);
    });
    result.sort((a, b) => a.round - b.round);
    return result;
  }
}
