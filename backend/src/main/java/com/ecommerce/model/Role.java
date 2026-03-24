package com.ecommerce.model;

/**
 * Application roles for Role-Based Access Control (RBAC).
 * ADMIN: Can create, read, update, and delete products.
 * USER:  Can only read (view) products.
 */
public enum Role {
    ROLE_ADMIN,
    ROLE_USER
}
