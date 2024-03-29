import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

const requestClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/'
})

interface LoginResponseData {
  tokens: {
    access: string
  }
  user: any
  message: string
}

interface RegisterResponseData {
  user: any
  message: string
}

interface RequestFunctionResponse {
  response: any
  success: boolean
}

export function saveUserData(userData: any): void {
  localStorage.setItem('userData', JSON.stringify(userData))
}

export function getToken() {
  const cookiesJson = localStorage.getItem('cookies')
  if (cookiesJson) {
    const cookies = JSON.parse(cookiesJson)
    const auth_token = cookies?.[1]?.value || ''
    if (auth_token.length !== 0) {
      return auth_token
    } else {
      return ''
    }
  } else {
    return ''
  }
}

function handleError(error: any): string {
  return (error as Error).message || 'An error occurred'
}

export const loginFunction = async (
  email: string,
  password: string
): Promise<RequestFunctionResponse> => {
  try {
    if (email === '' || password === '') {
      throw new Error("Email and password can't be empty")
    }

    const res: AxiosResponse<LoginResponseData> = await requestClient.post('/api/login', {
      email,
      password
    })
    // save the cookies in local storage
    window.electron.saveCookies()

    const { user, message } = res.data
    if (user) {
      saveUserData(user)
    }

    return { response: message, success: true }
  } catch (error) {
    return { response: handleError(error), success: false }
  }
}

export const registerFunction = async (
  username: string,
  email: string,
  password: string,
  password2: string
): Promise<RequestFunctionResponse> => {
  try {
    if (email === '' || password === '' || username === '') {
      throw new Error("Email, Username, and Password can't be empty")
    }
    if (password !== password2) {
      throw new Error('Both passwords must be the same.')
    }

    const res: AxiosResponse<RegisterResponseData> = await requestClient.post('/api/register', {
      username,
      email,
      password
    })

    const { user, message } = res.data

    if (user) {
      saveUserData(user)
    }

    return { response: message, success: true }
  } catch (error) {
    return { response: handleError(error), success: false }
  }
}

export const get = async (url: string): Promise<RequestFunctionResponse> => {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('Authentication token not set')
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const res = await requestClient.get(url, config)

    return { response: res.data.message, success: true }
  } catch (error) {
    return { response: handleError(error), success: false }
  }
}

export const post = async (
  url: string,
  data: Record<string, any>
): Promise<RequestFunctionResponse> => {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('Authentication token not set')
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const res = await requestClient.post(url, data, config)

    return { response: res.data.message, success: true }
  } catch (error) {
    return { response: handleError(error), success: false }
  }
}

// check token function method

export async function checkToken(): Promise<RequestFunctionResponse> {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('Authentication token not set')
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    const res = await requestClient.get('/api/check-token', config)

    return { response: res.data.message, success: true }
  } catch (error) {
    return { response: handleError(error), success: false }
  }
}
