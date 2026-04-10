package com.travelplanner.backend.auth.controller;

import com.travelplanner.backend.auth.dto.RegisterBody;
import com.travelplanner.backend.auth.dto.RegisterResponse;
import com.travelplanner.backend.auth.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse signUp(@RequestBody RegisterBody body) {
        userService.signUp(body.userName(), body.email(), body.password());
        return new RegisterResponse("Sign up successful.");
    }
}
