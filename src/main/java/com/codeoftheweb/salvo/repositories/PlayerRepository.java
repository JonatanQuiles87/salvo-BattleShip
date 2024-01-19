package com.codeoftheweb.salvo.repositories;

import com.codeoftheweb.salvo.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    Player findByUserName(@Param("userName") String userName);

}
