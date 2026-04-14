package com.travelplanner.backend.auth.model;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("app_user")
public class UserEntity {
    @Id
    @Column("user_id")
    private UUID userId;

    @Column("user_name")
    private String userName;

    @Column("email")
    private String email;

    @Column("password_hash")
    private String passwordHash;
}
