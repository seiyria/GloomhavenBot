import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as fs from 'fs';

import { BaseService } from '../base/BaseService';
import { Game } from '../interfaces/IGame';
import { CharResolverService } from './char-resolver';

interface IClassData {
  game: Game;
  assetPath: string;
  name: string;
  hp: number[];
  extraHP?: number[];
  handSize: number;
  perks: Array<{ text: string, count: number }>;
  extra?: { text: string, title: string };
}

@Singleton
@AutoWired
export class ClassDataService extends BaseService {

  @Inject private charService: CharResolverService;

  private classData: Record<string, IClassData> = {};

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getClassData(search: string) {
    return this.classData[search];
  }

  private loadAll() {
    ['Gloomhaven', 'JOTL', 'Custom'].forEach((game) => {
      if(!fs.existsSync(`assets/${game.toLowerCase()}/classes.yml`)) return;

      const classes: Record<string, IClassData> = YAML.load(`assets/${game.toLowerCase()}/classes.yml`) || {};
      Object.values(classes).forEach((c) => {
        c.game = game as unknown as Game;
        c.assetPath = game.toLowerCase();
      });

      Object.assign(this.classData, classes);

      Object.keys(classes).forEach((c) => {
        this.charService.addClass(c);
      });
    });
  }

}
