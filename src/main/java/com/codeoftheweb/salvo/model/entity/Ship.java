package com.codeoftheweb.salvo.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ships")
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String shipType;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gamePlayer_id")
    private GamePlayer gamePlayer;

    @JsonIgnore
    @OneToMany(mappedBy = "ship")
    private Set<ShipLocation> shipLocations = new HashSet<>();

    public Ship(){
    }

    public Ship(String type, GamePlayer gamePlayer){
        this.shipType = type;
        this.gamePlayer = gamePlayer;
    }

    public Long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }


    public String getShipType() {
        return shipType;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public void setShipType(String shipType) {
        this.shipType = shipType;
    }

    public Set<ShipLocation> getShipLocations() {
        return shipLocations;
    }

    public void setShipLocation(Set<ShipLocation> shipLocations) {
        this.shipLocations = shipLocations;
    }
}
