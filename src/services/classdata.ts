import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';

import { BaseService } from '../base/BaseService';

interface IClassData {
  name: string;
  hp: number[];
  extraHP?: number[];
  handSize: number;
  perks: Array<{ text: string, count: number }>;
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
    this.loadGloomClasses();
  }

  private loadGloomClasses() {
    this.classData = YAML.load('assets/gloomhaven/classes.yml');
  }

}
