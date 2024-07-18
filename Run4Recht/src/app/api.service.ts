import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourtDto, DepartmentDto, PeriodStatisticDto, RankingDto, StatisticDto, TimePeriodDto, UserDto, ProfileDto, TournamentInfoDto } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //private baseUrl = 'http://localhost:8080/api'; // Base URL of your Spring Boot application
  //private baseUrl = 'http://mux-team4.th-brandenburg.de:8080/api';
  //private baseUrl = ''
  //private baseUrl = 'https://mux-team4.th-brandenburg.de:8443/api';
  private baseUrl = 'https://muxteam4.de/api';


  constructor(private http: HttpClient) {}

  // Authentication APIs
  login(userDto: UserDto): Observable<UserDto> {
    console.log(`${this.baseUrl}/auth/login`)
    return this.http.post<UserDto>(`${this.baseUrl}/auth/login`, userDto);
  }

  // Court APIs
  getCourts(): Observable<CourtDto[]> {
    return this.http.get<CourtDto[]>(`${this.baseUrl}/gerichte`);
  }

  // Department APIs
  getDepartments(): Observable<DepartmentDto[]> {
    return this.http.get<DepartmentDto[]>(`${this.baseUrl}/dienstellen`);
  }

  getDepartmentById(departmentId: number): Observable<DepartmentDto> {
    return this.http.get<DepartmentDto>(`${this.baseUrl}/dienstellen/${departmentId}`);
  }

  // Ranking APIs
  getRankingsGroupByDepartment(): Observable<RankingDto[]> {
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking`);
  }
/*  getRankingsGroupByDepartment(departmentId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}`);
  }*/


  getRankingsGroupByDepartmentWithPeriod(timePeriodDto: TimePeriodDto): Observable<RankingDto[]> {
    return this.http.post<RankingDto[]>(`${this.baseUrl}/ranking/zeitraum`, timePeriodDto);
  }

  getRankingByCurrentMonth(): Observable<RankingDto[]> {
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking/aktueller-monat`);
  }

  // Statistic APIs
  getStatisticsGroupByDepartment(departmentId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}`);
  }

  getStatisticsGroupByDepartmentWithPeriod(departmentId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}/zeitraum`, timePeriodDto);
  }

  getStatisticsGroupByDepartmentWithPeriodAll(departmentId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}/zeitraumall`, timePeriodDto);
  }

  getStatistics(userId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}`);
  }

  getStatisticsWithPeriod(userId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}/zeitraum`, timePeriodDto);
  }

  getStatisticsByCurrentMonth(userId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/aktueller-monat/${userId}`);
  }

  updateStatistic(dto: StatisticDto): Observable<StatisticDto> {
    return this.http.put<StatisticDto>(`${this.baseUrl}/statistiken`, dto);
  }

  updateStatistics(psDto: PeriodStatisticDto): Observable<StatisticDto[]> {
    return this.http.put<StatisticDto[]>(`${this.baseUrl}/statistiken/zeitraum`, psDto);
  }

  // User APIs
  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseUrl}/mitarbeiter`);
  }

  getUsersInDepartment(departmentId: number): Observable<UserDto[]> {
    return this.http.post<UserDto[]>(`${this.baseUrl}/mitarbeiter/${departmentId}`, { departmentId });
  }

  // Profile APIs
  getProfile(userId: number): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.baseUrl}/profil/${userId}`);
  }

  updateProfile(userId: number, profileDto: ProfileDto): Observable<ProfileDto> {
    return this.http.put<ProfileDto>(`${this.baseUrl}/profil/${userId}`, profileDto);
  }

  // Tournament Information APIs
  getTournamentInfo(): Observable<TournamentInfoDto> {
    return this.http.get<TournamentInfoDto>(`${this.baseUrl}/turnierinfo`);
  }

  addTournamentInfo(infoDto: TournamentInfoDto): Observable<TournamentInfoDto> {
    return this.http.put<TournamentInfoDto>(`${this.baseUrl}/turnierinfo`, infoDto);
  }
}
