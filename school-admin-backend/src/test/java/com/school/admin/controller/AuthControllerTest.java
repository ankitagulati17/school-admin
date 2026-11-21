package com.school.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.admin.config.JwtAuthFilter;
import com.school.admin.config.JwtUtils;
import com.school.admin.config.UserDetailsServiceImpl;
import com.school.admin.dto.LoginRequest;
import com.school.admin.dto.LoginResponse;
import com.school.admin.dto.UserRequest;
import com.school.admin.exception.BadRequestException;
import com.school.admin.model.User;
import com.school.admin.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean JwtAuthFilter jwtAuthFilter;
    @MockBean JwtUtils jwtUtils;
    @MockBean UserDetailsServiceImpl userDetailsService;

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns 200 and token")
    void login_validCredentials_returns200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("password");

        LoginResponse response = new LoginResponse("mock.jwt.token", "admin", "System Admin", "ADMIN", 1L, null);
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("POST /api/auth/login with wrong credentials returns 4xx")
    void login_wrongCredentials_throwsFromService() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrong");

        when(authService.login(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }

    // ── POST /api/auth/register ──────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/auth/register by ADMIN returns 200 and created user")
    void register_byAdmin_returns200() throws Exception {
        UserRequest request = new UserRequest();
        request.setUsername("teacher3");
        request.setPassword("pass123");
        request.setFullName("New Teacher");
        request.setEmail("teacher3@school.edu");
        request.setRole("TEACHER");

        User savedUser = User.builder()
                .id(10L)
                .username("teacher3")
                .fullName("New Teacher")
                .email("teacher3@school.edu")
                .role(User.Role.TEACHER)
                .active(true)
                .build();

        when(authService.register(any(UserRequest.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("teacher3"))
                .andExpect(jsonPath("$.role").value("TEACHER"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/auth/register with duplicate username returns 400")
    void register_duplicateUsername_returns400() throws Exception {
        UserRequest request = new UserRequest();
        request.setUsername("admin");
        request.setPassword("pass123");
        request.setFullName("Duplicate Admin");
        request.setEmail("dup@school.edu");
        request.setRole("ADMIN");

        when(authService.register(any())).thenThrow(new BadRequestException("Username already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/auth/users ──────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/auth/users by ADMIN returns 200 and user list")
    void getUsers_byAdmin_returns200() throws Exception {
        User u1 = User.builder().id(1L).username("admin").role(User.Role.ADMIN).fullName("System Admin").build();
        User u2 = User.builder().id(2L).username("teacher1").role(User.Role.TEACHER).fullName("Mrs. Priya Mehta").build();
        when(authService.getAllUsers()).thenReturn(List.of(u1, u2));

        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("admin"))
                .andExpect(jsonPath("$[1].username").value("teacher1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/auth/users returns empty list when no users")
    void getUsers_emptyList_returns200() throws Exception {
        when(authService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/auth/users/{id} returns 200 on success")
    void deleteUser_byAdmin_returns200() throws Exception {
        mockMvc.perform(delete("/api/auth/users/1"))
                .andExpect(status().isOk());
    }
}
