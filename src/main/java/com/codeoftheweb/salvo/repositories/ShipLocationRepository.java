package com.codeoftheweb.salvo.repositories;

import com.codeoftheweb.salvo.model.entity.ShipLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface ShipLocationRepository extends JpaRepository<ShipLocation, Long> {
}
