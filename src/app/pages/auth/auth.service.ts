import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  login(email: string,password: string): boolean{
      if(email === 'front-technical@test.com' && password == "Technical_front**test"){
        return true; 
      }
      return false;
  }
  isConnected(): boolean{
    return !! localStorage.getItem('auth_token');
  }
  logout(): void{
    localStorage.removeItem('auth_token')
  }
    
}
