import { Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdnModel } from '@shared/models';
import { CacheService, PairService, PermissionsService, SioService } from '@core/services';
import { CdnLink } from '@core/interfaces';
import { GAAction, GACategory } from '@analytics/types';
import { AnalyticsService } from '@analytics/analytics.service';

import { Subject } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';

export enum CdnColumns {
  Checkbox = 'checkbox',
  Account = 'account',
  Url = 'url',
  StreamingActions = 'streaming-actions',
  Unlink = 'unlink',
  Settings = 'settings',
  Remove = 'remove'
}

const RESPONSIVE_COLUMNS = [
  CdnColumns.Account,
  CdnColumns.Url
];

@Component({
  selector: 'cdn',
  templateUrl: './cdn.component.html',
  styleUrls: ['./cdn.component.scss'],
  animations: [
    trigger('slideDown', [
      state('*', style({ height: '*' })),
      state('void', style({ height: 0 })),
      transition('* <=> void', [
        animate(200)
      ])
    ])
  ]
})
export class CdnComponent implements OnInit, OnDestroy {

  @Input()
  size: 'full' | 'medium' | 'small' = 'full';

  @Input()
  cdn: CdnModel;

  @Input()
  columns: string[] = [];

  @Input()
  pairId: string;

  @Input()
  @HostBinding('class.selected')
  isSelected: boolean;

  @HostBinding('attr.data-test-id')
  private get id(): string {
    return this.cdn.id;
  }

  @Input()
  hideStatus: boolean;

  @Input()
  hideScheduler: boolean;

  @Output()
  remove = new EventEmitter<string>();

  @Output()
  unlink = new EventEmitter<string>();

  @Output()
  sendStreamingAction = new EventEmitter<string>();

  @Output()
  toggleAutoStreaming = new EventEmitter<boolean>();

  @Output()
  toggleSelect = new EventEmitter<boolean>();

  buttonLabel: string;
  buttonIcon: string;
  error: string;

  isSchedulerOpened: boolean;
  isSchedulerApplying: boolean;
  isSettingsOpened: boolean;

  showResponsiveColumns: boolean;

  CdnColumns = CdnColumns;

  private visibleColumns: {
    [column: string]: boolean
  } = {};

  private action = 'start';
  private isDestroyedSubject = new Subject<void>();

  constructor(private elRef: ElementRef,
              public permissionsService: PermissionsService,
              private sio: SioService,
              private pairService: PairService,
              private analytics: AnalyticsService,
              private cache: CacheService) {
    this.clickAway = this.clickAway.bind(this);
  }

  ngOnInit() {
    this.showResponsiveColumns = RESPONSIVE_COLUMNS.some(
      (c) => this.columns.includes(c)
    );

    this.visibleColumns = this.columns.reduce((acc, c) => {
      acc[c] = true;
      return acc;
    }, {});

    this.updateButtonState(this.cdn.status);
    this.eventHandlers();
  }

  ngOnDestroy() {
    this.isDestroyedSubject.next();
    this.isDestroyedSubject.complete();
  }

  getUrl(): string {
    return `/${this.cache.slug()}/destinations/channels/${this.cdn.id}`;
  }

  getWebUrl(): string {
    return this.cdn.webUrl || this.cdn.rtmpUrl;
  }

  getCopyableUrl(): string {
    if (!this.cdn.host || !this.cdn.port) {
      return null;
    }

    const protocol = this.cdn.protocol || 'tcp';

    return `${protocol}://${this.cdn.host}:${this.cdn.port}`;
  }

  isDisabled(s: string): boolean {
    return ['stopping', 'starting', 'loading', 'not_ready', 'unloading'].includes(s);
  }

  toggleScheduler(): void {
    this.isSchedulerOpened = !this.isSchedulerOpened;

    if (this.isSchedulerOpened) {
      this.setClickAwayEventHandler();
    } else {
      this.unsetClickAwayEventHandler();
    }

    this.isSettingsOpened = false;
  }

  toggleSettings(): void {
    this.isSettingsOpened = !this.isSettingsOpened;

    if (this.isSettingsOpened) {
      this.setClickAwayEventHandler();
    } else {
      this.unsetClickAwayEventHandler();
    }

    this.isSchedulerOpened = false;
  }

  setSchedule(date: number): void {
    const ts = Math.floor(date / 1000);

    this.isSchedulerApplying = true;

    this.pairService
      .toggleAutoStreamingAt(
        this.cache.token(),
        this.cache.slug(),
        this.pairId,
        this.cdn.id,
        ts,
        'enable'
      )
      .pipe(
        finalize(() => this.isSchedulerApplying = false)
      )
      .subscribe(() => {
        this.cdn.autoStreamingAt = new Date(date).toISOString();

        this.toggleScheduler();
      });

    this.analytics.event(GAAction.SCHEDULER, {
      event_category: GACategory.CHANNEL,
      event_label: 'set'
    });
  }

  cancelSchedule(): void {
    this.isSchedulerApplying = true;

    this.pairService
      .toggleAutoStreamingAt(
        this.cache.token(),
        this.cache.slug(),
        this.pairId,
        this.cdn.id,
        null,
        'disable'
      )
      .pipe(
        finalize(() => this.isSchedulerApplying = false)
      )
      .subscribe(() => {
        this.cdn.autoStreamingAt = null;

        this.toggleScheduler();
      });

    this.analytics.event(GAAction.SCHEDULER, {
      event_category: GACategory.CHANNEL,
      event_label: 'cancel'
    });
  }

  onActionClick(): void {

    switch (this.action) {
      case 'start':
        this.cdn.status = 'starting';
        break;
      case 'stop':
        this.cdn.status = 'stopping';
        break;
      case 'retry':
        this.cdn.status = 'loading';
    }

    this.sendStreamingAction.emit(this.action);
    this.updateButtonState(this.cdn.status);

    this.isSchedulerOpened = false;
    this.isSettingsOpened = false;
  }

  hasColumn(name: CdnColumns): boolean {
    return this.visibleColumns[name];
  }

  private clickAway(e: Event) {
    if (this.elRef.nativeElement.contains(e.target)) {
      return;
    }

    this.isSchedulerOpened = false;
    this.isSettingsOpened = false;

    this.unsetClickAwayEventHandler();
  }

  private setClickAwayEventHandler() {
    window.addEventListener('click', this.clickAway, true);
  }

  private unsetClickAwayEventHandler() {
    window.removeEventListener('click', this.clickAway, true);
  }

  private updateButtonState(s: string): void {

    switch (s) {
      case 'ready':
      case 'loading':
      case 'not_ready':
        this.action = 'start';
        this.buttonLabel = 'Go Live';
        this.buttonIcon = 'start-streaming';
        break;
      case 'starting':
        this.buttonLabel = 'Starting';
        break;
      case 'streaming':
        this.action = 'stop';
        this.buttonLabel = 'Stop';
        this.buttonIcon = 'stop-streaming';
        break;
      case 'stopping':
        this.buttonLabel = 'Stopping';
        break;
      case 'error':
        this.action = 'retry';
        this.buttonLabel = 'Retry';
        this.buttonIcon = 'retry';
    }
  }

  private eventHandlers(): void {

    this.sio.connect(this.cache.token(), this.cache.slug());

    const cdnEvents = this.sio.cdns();

    cdnEvents
      .status(this.cdn.id)
      .pipe(
        takeUntil(this.isDestroyedSubject),
        filter(({ payload }) => payload.status !== 'unlinked')
      )
      .subscribe(({ payload }) => {
        this.cdn.statusChangedAt = payload.statusChangedAt;
        this.cdn.status = payload.status;
        this.updateButtonState(this.cdn.status);

        if (this.cdn.status === 'error') {
          this.error = payload.errorText;
        }
      });

    cdnEvents
      .updated(this.cdn.id)
      .pipe(
        takeUntil(this.isDestroyedSubject)
      )
      .subscribe(({ payload }) => {
        this.cdn.updateData(payload);
      });

    this.sio
      .pairs()
      .updated('*')
      .pipe(
        takeUntil(this.isDestroyedSubject),
        switchMap(({ payload }) => payload.linksToCdns),
        filter((link: CdnLink) => link.id === this.cdn.id)
      )
      .subscribe(link => {
        this.cdn.autoStreaming = link.autoStreaming;
        this.cdn.autoStreamingAt = link.autoStreamingAt;
      });
  }
}
