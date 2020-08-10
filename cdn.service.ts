import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseResponse, Cdn } from '@core/interfaces';
import { BaseApi } from '@core/services/api.service';
import { DiscoveryService } from '@core/services/discovery.service';

import { Observable } from 'rxjs';

export interface BaseDestinationRequest {
  title: string;
  type: string;
  channelName: string;
  autoReconnect?: boolean;
}

export interface CdnDestinationRequest extends BaseDestinationRequest {
  channelId: string;
  webUrl?: string;
  is360?: boolean;
}

export interface ManualRtmpDestinationRequest extends BaseDestinationRequest {
  rtmpUrl: string;
  streamKey: string;
  channelId?: string;
  login?: string;
  password?: string;
  userAgent?: string;
  webUrl?: string;
  backupUrl?: string;
  is360?: boolean;
  autoTweet?: boolean;
}

export interface ManualDestinationRequest extends BaseDestinationRequest {
  host: string;
  port: number;
  protocol: string;
  srtKeySize?: 128 | 192 | 256;
  srtPassPhrase?: string;
  srtLatency?: number;
  srtAdaptiveBitrate?: boolean;
}

export interface FbDestinationRequest extends CdnDestinationRequest {
  fbTitle: string;
  fbPageToken: string;
  fbDescription: string;
  fbDestinationType: 'timeline' | 'page' | 'event' | 'group';
  fbStreamType: 'AMBIENT' | 'REGULAR';
  privacy: 'SELF' | 'ALL_FRIENDS' | 'FRIENDS_OF_FRIENDS' | 'EVERYONE';
}

export interface LinkedinDestinationRequest extends CdnDestinationRequest {
  liTitle: string;
  liDescription: string;
  liShareComment: string;
  liPrivacy: 'PUBLIC' | 'CONNECTIONS';
}

export interface SputnikDestinationRequest {
  title: string;
  type: string;
  host: string;
  port: number;
  webUrl?: string;
}

export interface MpegTsDestinationRequest {
  type: string;
  title: string;
  host: string;
  port: number;
  protocol: string;
  multiTtl?: number;
  webUrl?: string;
}

export interface SrtDestinationRequest {
  type: string;
  title: string;
  host: string;
  port: number;
  srtKeySize: number | string;
  srtPassPhrase: string;
  srtLatency: number;
  webUrl?: string;
}

export interface WowzaDestinationRequest {
  type: string;
  title: string;
  port: number;
  login: string;
  password: string;
  rtmpUrl: string;
  streamKey: string;
}

@Injectable()
export class CdnService extends BaseApi {

  constructor(private discovery: DiscoveryService, http: HttpClient) {
    super(http);
  }

  getBaseUrl(): string {
    return this.discovery.CORE_API;
  }

  cdns(slug: string, query: { auth_token: string, sort?: string }): Observable<Cdn[]> {
    return this.get<Cdn[]>(`${slug}/cdns`, query);
  }

  cdn(token: string, slug: string, cdnId: string): Observable<Cdn> {
    return this.get<Cdn>(`${slug}/cdns/${cdnId}`, { auth_token: token });
  }

  addFacebookDestination(token: string, slug: string, cdn: FbDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addLivestreamDestination(token: string, slug: string, cdn: CdnDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addUstreamDestination(token: string, slug: string, cdn: CdnDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addYoutubeDestination(token: string, slug: string, cdn: CdnDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addTwitchDestination(token: string, slug: string, cdn: ManualRtmpDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addMixerDestination(token: string, slug: string, cdn: ManualRtmpDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addPeriscopeDestination(token: string, slug: string, cdn: ManualRtmpDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addManualRtmpDestination(token: string, slug: string, cdn: ManualRtmpDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addSrtDestination(token: string, slug: string, cdn: SrtDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addWowzaDestination(token: string, slug: string, cdn: WowzaDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addSputnikDestination(token: string, slug: string, cdn: SputnikDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addMpegTsDestination(token: string, slug: string, cdn: SputnikDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addManualDestination(token: string, slug: string, cdn: ManualDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addEasyliveDestination(token: string, slug: string, cdn: CdnDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  addLinkedinDestination(token: string, slug: string, cdn: LinkedinDestinationRequest): Observable<BaseResponse> {
    return this.create<BaseResponse>(`${slug}/cdns`, cdn, { auth_token: token });
  }

  modifyCdn(token: string, slug: string, cdnId: string, cdn: Cdn): Observable<void> {
    return this.update<void>(`${slug}/cdns/${cdnId}`, cdn, { auth_token: token });
  }

  deleteCdn(token: string, slug: string, cdnId: string): Observable<void> {
    return this.remove<void>(`${slug}/cdns/${cdnId}`, {}, { auth_token: token });
  }
}
