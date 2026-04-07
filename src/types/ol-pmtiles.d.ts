declare module 'ol-pmtiles' {
  import VectorTileSource from 'ol/source/VectorTile';

  export type PMTilesVectorSourceOptions = {
    url: string;
    attributions?: string | string[];
  };

  export class PMTilesVectorSource extends VectorTileSource {
    constructor(options: PMTilesVectorSourceOptions);
  }
}
