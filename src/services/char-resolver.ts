import { AutoWired, Singleton } from 'typescript-ioc';

import { BaseService } from '../base/BaseService';

const Characters = {
  'brute':        ['1'],
  'circles':      ['9', 'summoner'],
  'cragheart':    ['5'],
  'cthulhu':      ['11', 'plagueherald'],
  'diviner':      ['18'],
  'eclipse':      ['10', 'nightshroud', 'moon'],
  'lightning':    ['12', 'lightningbolts', 'lightningbolt', 'lightning-bolt', 'berserker'],
  'mindthief':    ['6'],
  'music-note':   ['13', 'musicnote', 'soothsinger', 'music', 'bard'],
  'saw':          ['15', 'sawbones'],
  'scoundrel':    ['4'],
  'spellweaver':  ['3'],
  'spike-head':   ['14', 'spikehead', 'doomstalker', 'angryface', 'angry-face'],
  'sun':          ['7', 'sunkeeper'],
  'three-spears': ['8', 'threespears', 'quartermaster', 'spears'],
  'three-swords': ['x', 'threeswords', 'bladeswarm'],
  'tinkerer':     ['2'],
  'triangles':    ['16', 'elementalist', 'triforce'],
  'two-minis':    ['17', 'twominis', 'beasttyrant', 'tyrant', 'phoenix'],
  'manifestation-of-corruption': ['manifestation'],
};

const AllCharacterAliases = Object.keys(Characters).reduce((prev, cur) => {w;
                                                                           prev[cur] = cur;
                                                                           Characters[cur].forEach((c) => prev[c] = cur);

                                                                           return prev;
}, {});

@Singleton
@AutoWired
export class CharResolverService extends BaseService {

  public resolveClass(search: string): string {
    return AllCharacterAliases[search];
  }

}
