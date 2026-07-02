export interface PluginHmacHeaders {
  productSlug: string
  productSecret: string
  signature: string
}

export interface PluginActivateRequest {
  license_key: string
  identifier: string
  label?: string
  product_version?: string
}

export interface PluginHeartbeatRequest {
  activation_id: string
  product_version?: string
}

export interface PluginValidateRequest {
  license_key: string
  identifier: string
  product_version?: string
}
