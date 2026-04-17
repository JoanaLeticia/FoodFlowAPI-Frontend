import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAdminToken() || authService.getToken(); 

  if (authToken) {
    const authRequest = request.clone({
      setHeaders: {
        Authorization: authToken
      }
    });
    return next(authRequest);
  }

  return next(request);
};