import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourtDto, DepartmentDto, PeriodStatisticDto, RankingDto, StatisticDto, TimePeriodDto, UserDto, ProfileDto, TournamentInfoDto } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://muxteam4.de/api';
  private email: string | null = null;
  private password: string | null = null;

  constructor(private http: HttpClient) {}

  // Method to generate headers with basic authentication
  private getHeaders(): HttpHeaders {
    if (this.email && this.password) {
      const auth = btoa(`${this.email}:${this.password}`);
      return new HttpHeaders({
        'Authorization': `Basic ${auth}`
      });
    }
    return new HttpHeaders();
  }

  // Method to set credentials after login
  setCredentials(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  // Authentication APIs
  login(userDto: UserDto): Observable<UserDto> {
    console.log(`${this.baseUrl}/auth/login`)
    return this.http.post<UserDto>(`${this.baseUrl}/auth/login`, userDto);
  }

  // Example for getting courts
  getCourts(): Observable<CourtDto[]> {
    const headers = this.getHeaders();
    return this.http.get<CourtDto[]>(`${this.baseUrl}/gerichte`, { headers });
  }

  // Department APIs
  getDepartments(): Observable<DepartmentDto[]> {
    const headers = this.getHeaders();
    return this.http.get<DepartmentDto[]>(`${this.baseUrl}/dienstellen`, { headers });
  }

  getDepartmentById(departmentId: number): Observable<DepartmentDto> {
    const headers = this.getHeaders();
    return this.http.get<DepartmentDto>(`${this.baseUrl}/dienstellen/${departmentId}`, { headers });
  }

  // Ranking APIs
  getRankingsGroupByDepartment(): Observable<RankingDto[]> {
    const headers = this.getHeaders();
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking`, { headers });
  }

  getRankingsGroupByDepartmentWithPeriod(timePeriodDto: TimePeriodDto): Observable<RankingDto[]> {
    const headers = this.getHeaders();
    return this.http.post<RankingDto[]>(`${this.baseUrl}/ranking/zeitraum`, timePeriodDto, { headers });
  }

  getRankingByCurrentMonth(): Observable<RankingDto[]> {
    const headers = this.getHeaders();
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking/aktueller-monat`, { headers });
  }

  // Statistic APIs
  getStatisticsGroupByDepartment(departmentId: number): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}`, { headers });
  }

  getStatisticsGroupByDepartmentWithPeriod(departmentId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}/zeitraum`, timePeriodDto, { headers });
  }

  getStatisticsGroupByDepartmentWithPeriodAll(departmentId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}/zeitraumall`, timePeriodDto, { headers });
  }

  getStatistics(userId: number): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}`, { headers });
  }

  getStatisticsWithPeriod(userId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}/zeitraum`, timePeriodDto, { headers });
  }

  getStatisticsByCurrentMonth(userId: number): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/aktueller-monat/${userId}`, { headers });
  }

  updateStatistic(dto: StatisticDto): Observable<StatisticDto> {
    const headers = this.getHeaders();
    return this.http.put<StatisticDto>(`${this.baseUrl}/statistiken`, dto, { headers });
  }

  updateStatistics(psDto: PeriodStatisticDto): Observable<StatisticDto[]> {
    const headers = this.getHeaders();
    return this.http.put<StatisticDto[]>(`${this.baseUrl}/statistiken/zeitraum`, psDto, { headers });
  }

  // User APIs
  getUsers(): Observable<UserDto[]> {
    const headers = this.getHeaders();
    return this.http.get<UserDto[]>(`${this.baseUrl}/mitarbeiter`, { headers });
  }

  getUsersInDepartment(departmentId: number): Observable<UserDto[]> {
    const headers = this.getHeaders();
    return this.http.post<UserDto[]>(`${this.baseUrl}/mitarbeiter/${departmentId}`, { departmentId }, { headers });
  }

  // Profile APIs
  getProfile(userId: number): Observable<ProfileDto> {
    const headers = this.getHeaders();
    return this.http.get<ProfileDto>(`${this.baseUrl}/profil/${userId}`, { headers });
  }

  updateProfile(userId: number, profileDto: ProfileDto): Observable<ProfileDto> {
    const headers = this.getHeaders();
    return this.http.put<ProfileDto>(`${this.baseUrl}/profil/${userId}`, profileDto, { headers });
  }

  // Tournament Information APIs
  getTournamentInfo(): Observable<TournamentInfoDto> {
    const headers = this.getHeaders();
    return this.http.get<TournamentInfoDto>(`${this.baseUrl}/turnierinfo`, { headers });
  }

  addTournamentInfo(infoDto: TournamentInfoDto): Observable<TournamentInfoDto> {
    const headers = this.getHeaders();
    return this.http.put<TournamentInfoDto>(`${this.baseUrl}/turnierinfo`, infoDto, { headers });
  }
}
