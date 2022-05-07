import { Pipe, PipeTransform } from '@angular/core';
import { ResultEnum } from '../models/game';

@Pipe({
  name: 'result'
})
export class ResultPipe implements PipeTransform {

  transform(value: ResultEnum): string {
    switch(value) {
      case ResultEnum.WhiteWins:
        return "1-0";
      case ResultEnum.Draw:
        return "1/2-1/2";
      case ResultEnum.BlackWins:
        return "0-1";
    }
  }
}
