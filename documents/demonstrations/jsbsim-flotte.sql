PRAGMA foreign_keys = ON;
CREATE TABLE vehicules (
  id TEXT PRIMARY KEY, nom TEXT NOT NULL, categorie TEXT NOT NULL,
  envergure_m REAL, surface_alaire_m2 REAL, masse_vide_kg REAL,
  fichier_source TEXT NOT NULL
);
CREATE TABLE modeles_moteur (
  id TEXT PRIMARY KEY, modele TEXT NOT NULL, type TEXT NOT NULL,
  propulseur TEXT, fichier_source TEXT
);
CREATE TABLE installations_moteur (
  vehicule_id TEXT NOT NULL REFERENCES vehicules(id),
  emplacement TEXT NOT NULL,
  moteur_id TEXT NOT NULL REFERENCES modeles_moteur(id),
  PRIMARY KEY (vehicule_id, emplacement)
);

BEGIN TRANSACTION;
INSERT INTO "vehicules" VALUES('737','737','aircraft',28.86456,108.78946,37648.16671,'aircraft/737/737.xml');
INSERT INTO "vehicules" VALUES('A320','A320-200','aircraft',33.92424,122.353304,50348.75307,'aircraft/A320/A320.xml');
INSERT INTO "vehicules" VALUES('C130','C130','aircraft',40.386,285.229055,47627.19885,'aircraft/C130/C130.xml');
INSERT INTO "vehicules" VALUES('Concorde','Aerospatiale/BAC Concorde','aircraft',25.551384,358.234122,78698.276195,'aircraft/Concorde/Concorde.xml');
INSERT INTO "vehicules" VALUES('F450','F450','unmanned',0.127,0.016129,1.4,'aircraft/F450/F450.xml');
INSERT INTO "vehicules" VALUES('MD11','MD11','aircraft',51.6636,338.91029,171593.993571,'aircraft/MD11/MD11.xml');
INSERT INTO "vehicules" VALUES('Submarine_Scout','SubmarineScout','lighter-than-air',9.1,65.0,733.5,'aircraft/Submarine_Scout/Submarine_Scout.xml');
INSERT INTO "vehicules" VALUES('XB-70','XB-70','aircraft',32.004,585.103346,136077.711,'aircraft/XB-70/XB-70.xml');
INSERT INTO "vehicules" VALUES('ah1s','ah1s-jsbsim','rotorcraft',3.2766,1.54219,3855.535145,'aircraft/ah1s/ah1s.xml');
INSERT INTO "vehicules" VALUES('c172p','c172','aircraft',10.91184,16.165129,680.388555,'aircraft/c172p/c172p.xml');
INSERT INTO "vehicules" VALUES('dr1','Fokker Dr.1','aircraft',7.199376,18.702311,405.965171,'aircraft/dr1/dr1.xml');
INSERT INTO "vehicules" VALUES('f16','General Dynamics F-16A','aircraft',9.144,27.870912,7892.507238,'aircraft/f16/f16.xml');
INSERT INTO "vehicules" VALUES('p51d','P-51D (JSBSim)','aircraft',11.30808,21.832214,3231.845636,'aircraft/p51d/p51d.xml');
INSERT INTO "vehicules" VALUES('paraglider','paraglider','aircraft',8.8392,20.438669,4.535924,'aircraft/paraglider/paraglider.xml');
INSERT INTO "vehicules" VALUES('weather-balloon','Weather Balloon','lighter-than-air',1.88976,0.91045,0.8,'aircraft/weather-balloon/weather-balloon.xml');
INSERT INTO "vehicules" VALUES('wrightFlyer1903','wrightFlyer1903','aircraft',12.292584,47.38055,197.312681,'aircraft/wrightFlyer1903/wrightFlyer1903.xml');
INSERT INTO "vehicules" VALUES('x24b','X-24B','spacecraft',5.7912,30.704455,3855.535145,'aircraft/x24b/x24b.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0001','CFM56','turbine','direct','engine/CFM56.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0002','CFM56_5','turbine','direct','engine/CFM56_5.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0003','t56','turbine','t56_prop','engine/t56.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0004','Olympus593Mrk610','turbine','direct','engine/Olympus593Mrk610.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0005','DJI_E305','electric','DJI_9450','engine/DJI_E305.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0006','CF6-80C2','turbine','direct','engine/CF6-80C2.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0007','eng_RRhawk','piston','prop_SSZ','engine/eng_RRhawk.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0008','YJ93-GE-3','turbine','direct','engine/YJ93-GE-3.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0009','electric_1500hp','electric','ah1s_rotor','aircraft/ah1s/Engines/electric_1500hp.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0010','electric_1hp_dummy','electric','ah1s_tail_rotor','aircraft/ah1s/Engines/electric_1hp_dummy.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0011','eng_io320','piston','prop_75in2f','engine/eng_io320.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0012','Oberursel-UrII','piston','Dr1_propeller','engine/Oberursel-UrII.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0013','F100-PW-229','turbine','direct','engine/F100-PW-229.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0014','Packard-V-1650-7','piston','P51prop','aircraft/p51d/Engines/Packard-V-1650-7.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0015','Polini_THOR80','piston','DT_Propeller','aircraft/paraglider/Engines/Polini_THOR80.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0016','wright1903_engine','piston','wright1903_propellers','engine/wright1903_engine.xml');
INSERT INTO "modeles_moteur" VALUES('ENG-0017','XLR99','rocket','xlr99_nozzle','engine/XLR99.xml');
INSERT INTO "installations_moteur" VALUES('737','engine-0','ENG-0001');
INSERT INTO "installations_moteur" VALUES('737','engine-1','ENG-0001');
INSERT INTO "installations_moteur" VALUES('A320','engine-0','ENG-0002');
INSERT INTO "installations_moteur" VALUES('A320','engine-1','ENG-0002');
INSERT INTO "installations_moteur" VALUES('C130','engine-0','ENG-0003');
INSERT INTO "installations_moteur" VALUES('C130','engine-1','ENG-0003');
INSERT INTO "installations_moteur" VALUES('C130','engine-2','ENG-0003');
INSERT INTO "installations_moteur" VALUES('C130','engine-3','ENG-0003');
INSERT INTO "installations_moteur" VALUES('Concorde','engine-0','ENG-0004');
INSERT INTO "installations_moteur" VALUES('Concorde','engine-1','ENG-0004');
INSERT INTO "installations_moteur" VALUES('Concorde','engine-2','ENG-0004');
INSERT INTO "installations_moteur" VALUES('Concorde','engine-3','ENG-0004');
INSERT INTO "installations_moteur" VALUES('F450','engine-0','ENG-0005');
INSERT INTO "installations_moteur" VALUES('F450','engine-1','ENG-0005');
INSERT INTO "installations_moteur" VALUES('F450','engine-2','ENG-0005');
INSERT INTO "installations_moteur" VALUES('F450','engine-3','ENG-0005');
INSERT INTO "installations_moteur" VALUES('MD11','engine-0','ENG-0006');
INSERT INTO "installations_moteur" VALUES('MD11','engine-1','ENG-0006');
INSERT INTO "installations_moteur" VALUES('MD11','engine-2','ENG-0006');
INSERT INTO "installations_moteur" VALUES('Submarine_Scout','engine-0','ENG-0007');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-0','ENG-0008');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-1','ENG-0008');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-2','ENG-0008');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-3','ENG-0008');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-4','ENG-0008');
INSERT INTO "installations_moteur" VALUES('XB-70','engine-5','ENG-0008');
INSERT INTO "installations_moteur" VALUES('ah1s','engine-0','ENG-0009');
INSERT INTO "installations_moteur" VALUES('ah1s','engine-1','ENG-0010');
INSERT INTO "installations_moteur" VALUES('c172p','engine-0','ENG-0011');
INSERT INTO "installations_moteur" VALUES('dr1','engine-0','ENG-0012');
INSERT INTO "installations_moteur" VALUES('f16','engine-0','ENG-0013');
INSERT INTO "installations_moteur" VALUES('p51d','engine-0','ENG-0014');
INSERT INTO "installations_moteur" VALUES('paraglider','engine-0','ENG-0015');
INSERT INTO "installations_moteur" VALUES('wrightFlyer1903','engine-0','ENG-0016');
INSERT INTO "installations_moteur" VALUES('x24b','engine-0','ENG-0017');
COMMIT;
