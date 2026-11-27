import { api } from '@/lib/api';

export const apiClient = {
  signup: (data: { email: string; password: string; displayName: string }) =>
    api.signup(data),
  login: (data: { email: string; password: string }) => api.login(data),
  logout: () => api.logout(),
  me: () => api.me(),
  createMeeting: (data: { title: string }) => api.createMeeting(data),
  myMeetings: () => api.myMeetings(),
  getMeeting: (code: string) => api.getMeeting(code),
  getToken: (code: string, displayName: string) => api.getToken(code, displayName),
};
