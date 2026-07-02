import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'

class InternalService extends BaseService {
  triggerRevalidate(paths: string[]) {
    return this.postRaw(API_ENDPOINTS.INTERNAL.REVALIDATE, { paths })
  }
}

export const internalService = new InternalService()
