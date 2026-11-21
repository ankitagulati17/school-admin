package com.school.admin.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtUtils Tests")
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Inject values that would normally come from application.properties
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret",
                "school-admin-super-secret-jwt-key-for-testing-only-2024");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", 86400000L); // 24 hours
    }

    private UserDetails buildUserDetails(String username) {
        return new User(username, "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    // ── Token Generation Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Generate token returns non-null JWT string")
    void generateToken_returnsNonNullToken() {
        UserDetails userDetails = buildUserDetails("admin");

        String token = jwtUtils.generateToken(userDetails, 1L, "ADMIN");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("Generated token has 3 parts separated by dots (JWT format)")
    void generateToken_hasValidJwtStructure() {
        UserDetails userDetails = buildUserDetails("admin");

        String token = jwtUtils.generateToken(userDetails, 1L, "ADMIN");

        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("Different users get different tokens")
    void generateToken_differentUsers_getDifferentTokens() {
        UserDetails admin   = buildUserDetails("admin");
        UserDetails teacher = buildUserDetails("teacher1");

        String adminToken   = jwtUtils.generateToken(admin,   1L, "ADMIN");
        String teacherToken = jwtUtils.generateToken(teacher, 2L, "TEACHER");

        assertThat(adminToken).isNotEqualTo(teacherToken);
    }

    // ── Extract Username Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Extract username returns correct username from token")
    void extractUsername_returnsCorrectUsername() {
        UserDetails userDetails = buildUserDetails("teacher1");
        String token = jwtUtils.generateToken(userDetails, 2L, "TEACHER");

        String username = jwtUtils.extractUsername(token);

        assertThat(username).isEqualTo("teacher1");
    }

    // ── Token Validation Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Valid token is validated successfully")
    void isTokenValid_validToken_returnsTrue() {
        UserDetails userDetails = buildUserDetails("clerk1");
        String token = jwtUtils.generateToken(userDetails, 3L, "CLERK");

        boolean valid = jwtUtils.isTokenValid(token, userDetails);

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("Token for different user fails validation")
    void isTokenValid_differentUser_returnsFalse() {
        UserDetails admin   = buildUserDetails("admin");
        UserDetails teacher = buildUserDetails("teacher1");
        String token = jwtUtils.generateToken(admin, 1L, "ADMIN");

        boolean valid = jwtUtils.isTokenValid(token, teacher);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("Expired token fails validation")
    void isTokenValid_expiredToken_returnsFalse() {
        JwtUtils expiredUtils = new JwtUtils();
        ReflectionTestUtils.setField(expiredUtils, "jwtSecret",
                "school-admin-super-secret-jwt-key-for-testing-only-2024");
        ReflectionTestUtils.setField(expiredUtils, "jwtExpiration", -1000L); // already expired

        UserDetails userDetails = buildUserDetails("admin");
        String expiredToken = expiredUtils.generateToken(userDetails, 1L, "ADMIN");

        assertThatThrownBy(() -> expiredUtils.isTokenValid(expiredToken, userDetails))
                .isInstanceOf(Exception.class);
    }
}
