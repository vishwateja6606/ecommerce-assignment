package com.ecommerce.security;

import com.ecommerce.model.Role;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

/**
 * After a successful OAuth2 login, create/update the local User record,
 * mint a JWT, and redirect the browser back to the React frontend with the token.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uris}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // google, github, facebook

        Map<String, Object> attrs = oAuth2User.getAttributes();
        String email    = extractEmail(registrationId, attrs);
        String name     = extractName(registrationId, attrs);
        String imageUrl = extractImageUrl(registrationId, attrs);
        String providerId = String.valueOf(attrs.getOrDefault("sub", attrs.get("id")));

        // Find or create a local User record for this OAuth2 identity
        User user = userRepository.findByProviderAndProviderId(registrationId, providerId)
                .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

        if (user == null) {
            // First-time OAuth2 login – create new user
            String username = generateUsername(email);
            user = User.builder()
                    .username(username)
                    .email(email)
                    .fullName(name)
                    .imageUrl(imageUrl)
                    .provider(registrationId)
                    .providerId(providerId)
                    .role(Role.ROLE_USER)
                    .build();
        } else {
            // Update profile fields that may have changed
            user.setFullName(name);
            user.setImageUrl(imageUrl);
            user.setProvider(registrationId);
            user.setProviderId(providerId);
        }

        userRepository.save(user);
        log.info("OAuth2 login: {} via {}", user.getUsername(), registrationId);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    // ── Attribute extraction helpers ─────────────────────────────────────────

    private String extractEmail(String provider, Map<String, Object> attrs) {
        return switch (provider) {
            case "github" -> Optional.ofNullable((String) attrs.get("email"))
                    .orElse(attrs.get("login") + "@github.local");
            default -> (String) attrs.get("email");
        };
    }

    private String extractName(String provider, Map<String, Object> attrs) {
        return switch (provider) {
            case "github" -> (String) attrs.getOrDefault("name", attrs.get("login"));
            case "facebook" -> (String) attrs.get("name");
            default -> (String) attrs.get("name");
        };
    }

    private String extractImageUrl(String provider, Map<String, Object> attrs) {
        return switch (provider) {
            case "github"   -> (String) attrs.get("avatar_url");
            case "facebook" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> picture = (Map<String, Object>) attrs.get("picture");
                yield picture != null ? (String) ((Map<?, ?>) picture.get("data")).get("url") : null;
            }
            default -> (String) attrs.get("picture");
        };
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
        return userRepository.existsByUsername(base) ? base + System.currentTimeMillis() % 10000 : base;
    }
}
