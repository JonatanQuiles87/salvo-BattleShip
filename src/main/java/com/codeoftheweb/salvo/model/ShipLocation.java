package com.codeoftheweb.salvo.model;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "ship_locations")
@Getter
@Setter
@NoArgsConstructor

public class ShipLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ship_id")
    private Ship ship;

    @Column(name = "grid_cell")
    private String gridCell;

    public ShipLocation(Ship ship, String gridCell){
        this.ship = ship;
        this.gridCell = gridCell;
    }
}