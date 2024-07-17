export class Utils {
    static normalizeDate(datum: any) : string {
        if (Array.isArray(datum)) {
            const [year, month, day] = datum;
            return new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
          }
          return new Date(Date.UTC(new Date(datum).getFullYear(), new Date(datum).getMonth(), new Date(datum).getDate())).toISOString().split('T')[0];
      }
}