import { AppState } from './../state/app.reducer';
import { CityDailyWeather, CityWeather } from './../models/weather.model';
import { map, takeUntil } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { responseToCityWeather, responseToCityDailyWeather } from '../utils/response.utils';
import { select, Store } from '@ngrx/store';
import * as fromConfigSelectors from '../state/config/config.selectors';
import { Units } from '../models/units.enum';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private serviceDestroyed$ = new Subject();

  private unit: Units;

  constructor(private http: HttpClient,
              private store: Store<AppState>) {
                store
                .pipe(
                  select(fromConfigSelectors.selectUnitConfig),
                  takeUntil(this.serviceDestroyed$),
                )
                .subscribe((unit: Units) => this.unit = unit);
  }

  getCityWeatherByQuery(query: string): Observable<CityWeather> {
    const params = new HttpParams({ fromObject: { q: query } });
    return this.doGet('weather', params)
      .pipe(map(response => responseToCityWeather(response)));
  }

  getCityWeatherByCoord(lat: number, lon: number): Observable<CityWeather> {
    const params = new HttpParams({fromObject: {
      lat: lat.toString(),
      lon: lon.toString(),
    }});
    return this.doGet<any>('weather', params)
      .pipe(map(response => responseToCityWeather(response)));
  }

  getWeatherDetails(lat: number, lon: number): Observable<CityDailyWeather> {
    const params = new HttpParams({fromObject: {
      lat: lat.toString(),
      lon: lon.toString(),
      exclude: 'minutely,hourly',
    }});
    return this.doGet<any>('onecall', params)
      .pipe(map(response => responseToCityDailyWeather(response)));
  }

  getCityWeatherById(id: string): Observable<CityWeather> {
    const params = new HttpParams({fromObject: {id}});
    return this.doGet<any>('weather', params)
      .pipe(map(response => responseToCityWeather(response)));
  }

  private doGet<T>(url: string, params: HttpParams): Observable<T> {
    params = params.append('appid', environment.apikey);
    params = params.append('lang', 'pt_br');
    if (this.unit !== Units.SI) {
      params = params.append('units', this.unit.toLocaleLowerCase());
    }
    return this.http.get<T>(`https://api.openweathermap.org/data/2.5/${ url }`, { params });
  }
}
