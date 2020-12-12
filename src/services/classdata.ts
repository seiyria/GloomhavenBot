import { Game } from 'discord.js';
import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';

import { BaseService } from '../base/BaseService';

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

  private classData: Record<string, IClassData> = {};

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getClassData(search: string) {
    return this.classData[search];
  }

  private loadAll() {
    ['Gloomhaven', 'JOTL'].forEach((game) => {
      const classes: Record<string, IClassData> = YAML.load(`assets/${game.toLowerCase()}/classes.yml`);
      Object.values(classes).forEach((c) => {
        c.game = game as unknown as Game;
        c.assetPath = game.toLowerCase();
      });

      Object.assign(this.classData, classes);
    });
  }

}
