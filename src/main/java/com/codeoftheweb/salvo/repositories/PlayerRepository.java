package com.codeoftheweb.salvo.repositories;

import com.codeoftheweb.salvo.model.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByUsername (String username);
}
