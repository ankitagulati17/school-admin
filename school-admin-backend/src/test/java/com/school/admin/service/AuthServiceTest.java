package com.school.admin.service;

import com.school.admin.config.JwtUtils;
import com.school.admin.config.UserDetailsServiceImpl;
import com.school.admin.dto.LoginRequest;
import com.school.admin.dto.LoginResponse;
import com.school.admin.dto.UserRequest;
import com.school.admin.exception.BadRequestException;
import com.school.admin.model.User;
import com.school.admin.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    // Use interfaces where possible so Mockito subclass-mocking works without byte-buddy
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;
    @Mock private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthService authService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .username("admin")
                .password("encodedPassword")
                .fullName("System Admin")
                .email("admin@school.edu")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
    }

    // ── Login Tests ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Login with valid credentials returns JWT token")
    void login_validCredentials_returnsLoginResponse() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("password");

        UserDetails userDetails = mock(UserDetails.class);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(userDetailsService.loadUserByUsername("admin")).thenReturn(userDetails);
        when(jwtUtils.generateToken(userDetails, 1L, "ADMIN")).thenReturn("mock.jwt.token");

        LoginResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUsername()).isEqualTo("admin");
        assertThat(response.getRole()).isEqualTo("ADMIN");
        assertThat(response.getUserId()).isEqualTo(1L);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Login with wrong password throws BadCredentialsException")
    void login_wrongPassword_throwsException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrongpassword");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Login with non-existent username throws BadRequestException")
    void login_userNotFound_throwsBadRequestException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("ghost");
        request.setPassword("password");

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("User not found");
    }

    // ── Register Tests ───────────────────────────────────────────────────────

    @Test
    @DisplayName("Register new user saves and returns user")
    void register_newUser_savesSuccessfully() {
        UserRequest request = new UserRequest();
        request.setUsername("teacher3");
        request.setPassword("pass123");
        request.setFullName("New Teacher");
        request.setEmail("teacher3@school.edu");
        request.setRole("TEACHER");

        when(userRepository.existsByUsername("teacher3")).thenReturn(false);
        when(userRepository.existsByEmail("teacher3@school.edu")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });

        User saved = authService.register(request);

        assertThat(saved.getUsername()).isEqualTo("teacher3");
        assertThat(saved.getRole()).isEqualTo(User.Role.TEACHER);
        assertThat(saved.isActive()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register with duplicate username throws BadRequestException")
    void register_duplicateUsername_throwsException() {
        UserRequest request = new UserRequest();
        request.setUsername("admin");
        request.setPassword("pass123");
        request.setFullName("Admin2");
        request.setEmail("admin2@school.edu");
        request.setRole("ADMIN");

        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Username already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register with duplicate email throws BadRequestException")
    void register_duplicateEmail_throwsException() {
        UserRequest request = new UserRequest();
        request.setUsername("newuser");
        request.setPassword("pass123");
        request.setFullName("New User");
        request.setEmail("admin@school.edu");
        request.setRole("CLERK");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("admin@school.edu")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email already registered");
    }

    // ── Toggle User Tests ────────────────────────────────────────────────────

    @Test
    @DisplayName("Toggle active user sets them inactive")
    void toggleUserStatus_activeUser_becomesInactive() {
        adminUser.setActive(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.toggleUserStatus(1L);

        assertThat(result.isActive()).isFalse();
    }

    @Test
    @DisplayName("Toggle inactive user sets them active")
    void toggleUserStatus_inactiveUser_becomesActive() {
        adminUser.setActive(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.toggleUserStatus(1L);

        assertThat(result.isActive()).isTrue();
    }

    @Test
    @DisplayName("Toggle non-existent user throws BadRequestException")
    void toggleUserStatus_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.toggleUserStatus(99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("User not found");
    }

    // ── Get All Users ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Get all users returns list")
    void getAllUsers_returnsAllUsers() {
        User teacher = User.builder().id(2L).username("teacher1").role(User.Role.TEACHER).build();
        when(userRepository.findAll()).thenReturn(List.of(adminUser, teacher));

        List<User> users = authService.getAllUsers();

        assertThat(users).hasSize(2);
        assertThat(users).extracting(User::getUsername).containsExactly("admin", "teacher1");
    }

    // ── Delete User Tests ────────────────────────────────────────────────────

    @Test
    @DisplayName("Delete existing user calls repository delete")
    void deleteUser_existingUser_deletesSuccessfully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        authService.deleteUser(1L);

        verify(userRepository).delete(adminUser);
    }

    @Test
    @DisplayName("Delete non-existent user throws BadRequestException")
    void deleteUser_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.deleteUser(99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).delete(any());
    }
}
