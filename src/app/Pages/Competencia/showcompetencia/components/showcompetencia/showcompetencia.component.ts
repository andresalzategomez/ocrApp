import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Competencia, Oleada } from '../../../models/competencia.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../../Categoria/services/categoria.service';
import { AtletaService } from '../../../../Atleta/services/atleta.service';
import { Atleta } from '../../../../Atleta/models/atleta.model';
import { CompetenciaService } from '../../../services/competencia.service';
import { Categoria } from '../../../../Categoria/models/categoria.model';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { GanadoresDialogComponent } from '../../../ganadores-dialog/ganadores-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { dialogIniciarOleadaComponent } from '../../../dialoginiciaroleada/dialoginiciaroleada.component';

declare let alertify: any; 

@Component({
  selector: 'app-showcompetencia',
  templateUrl: './showcompetencia.component.html',
  styleUrls: ['./showcompetencia.component.css']
})
export class ShowCompetenciaComponent implements OnInit {

  competenciaIniciada:boolean = false
  competenciaFinalizada:boolean = false
  HoraInicio:string;
  HoraFin:string;
  idCompetencia:number
  competencia:Competencia
  oleadas:Oleada[] = []
  categorias:Categoria[]=[]
	atletasList:Atleta [] = []
	popUpDeleteUserResponse : any;
	showType	    				: string = 'list';
	displayedProductColumns : string [] = ['no_atleta', 'no_oleada', 'categoria', 'nombre', 'documento', 'email', 'tiempo', 'estado'];
	@ViewChild(MatPaginator) paginator : MatPaginator;
	@ViewChild(MatSort) sort           : MatSort;

	constructor(
    public translate : TranslateService,
    private categoriaService: CategoriaService,
    private competenciaService: CompetenciaService,
    private atletaService: AtletaService,
    private router : Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
	) { }

	ngOnInit() {
    this.idCompetencia =  this.route.snapshot.params['idCompetencia'];
    console.log("idCompetencia", this.idCompetencia);
    
		this.findCompetenciaById()
		this.findOleadaByCompetencia()
		this.getCategoriaByCompetencia()
    this.findAtletaByCategoria()
	}

  findCompetenciaById(){
    this.competenciaService.getCompetenciaById(this.idCompetencia)
      .subscribe({
        next: (data: Competencia) => {
          console.log("data", data);
          
          this.competencia = data[0];
          if(this.competencia.estado == "FINALIZADA"){
            this.HoraInicio = formatDate((this.competencia.hora_inicio), 'HH:mm:ss', 'en-US');
            this.HoraFin = formatDate(this.competencia.hora_final, 'HH:mm:ss', 'en-US');

            this.competenciaIniciada = true;
            this.competenciaFinalizada = true;
          }else{
            if(this.competencia.hora_inicio != null){
              this.HoraInicio = formatDate((this.competencia.hora_inicio), 'HH:mm:ss', 'en-US');
              this.competenciaIniciada = true;
            }
          }
          console.log("data", this.competencia);
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  findOleadaByCompetencia(){
    this.competenciaService.getOleadaByCompetencia(this.idCompetencia)
      .subscribe({
        next: (data: Oleada[]) => {
          console.log("data oleadas", data);
          this.oleadas = data;
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  getCategoriaByCompetencia(){
    this.categoriaService.getCategoriaByCompetencia(this.idCompetencia)
      .subscribe({
        next: (data: Categoria[]) => {
          this.categorias = data
          console.log("categorias", this.categorias);
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  findAtletaByCategoria(){
    this.atletaService.getAtletaByCompetencia(this.idCompetencia)
      .subscribe({
        next: (data: Atleta[]) => {
          this.atletasList = data
          console.log("data", this.atletasList);
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  changeCategoria(idCategoria){
    let nombreCategoria:string = '';
    const categoriaFind = this.categorias.find(item => item.id === idCategoria);

    if(categoriaFind) nombreCategoria = categoriaFind.nombre
    return nombreCategoria;
  }

  async iniciarCompetencia(){
    Swal.fire({
      title: 'Iniciar Competencia',
      text: `Está seguro que desea iniciar la competencia?`,
      //icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonColor: '',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#1FAEEF',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        this.competenciaIniciada = true;
        const fechaActual = new Date
        this.HoraInicio = formatDate(new Date(fechaActual), 'HH:mm:ss', 'en-US');
        this.competencia.hora_inicio = formatDate(new Date(fechaActual), 'yyyy-MM-dd HH:mm:ss.SSS-05:00', 'en-US');
        this.competencia.hora_final = this.competencia.hora_inicio
        this.updateCompetencia(this.competencia)
      }
    });
  }

  lanzarOleada(){
    const dialogRef = this.dialog.open(dialogIniciarOleadaComponent, { width: '80%', minWidth: '70vw', maxHeight: '95vh', data: {competencia: this.competencia, categoria: this.categorias} });

      dialogRef.afterClosed().subscribe(result => {
        console.log("result", result);
        
        if(result){
          const oleadaFind = this.oleadas.find(oleada => (oleada.no_oleada === result?.no_oleada && oleada.id_categoria == result.id_categoria));
          if(!oleadaFind){
            console.log("encontrada", result);
            this.saveOleada(result);
          }else{
            alertify.set('notifier','position', 'top-right');
            alertify.warning('La oleada ya está iniciada!',2);
          }
        }
      });
  }

  saveOleada(oleada){
    this.oleadas.push(oleada);
    console.log("oleada +1", this.oleadas);
    
    this.competenciaService.saveOleada(oleada)
      .subscribe({
        next: (data: any) => {
          console.log("data", data);
          if(data?.response == 'OK'){
            alertify.set('notifier','position', 'top-right');
            alertify.success('Oleada creada con exito!',2);
          }
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  private buildSelectHtml(optionsList: any[]): string {
    let resultString = ''; 
    for (let i = 0; i < optionsList.length; i++) { 
      resultString += '<option value=' + optionsList[i].id + '>' + optionsList[i].nombre + '</option>'
    }
    return resultString; 
  }

  finalizarCompetencia(){
    Swal.fire({
      title: 'Finalizar Competencia',
      text: `Está seguro que desea finalziar la competencia?`,
      //icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonColor: '',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#1FAEEF',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.value) {
        this.competenciaFinalizada = true;
        const fechaActual = new Date
        this.HoraFin = formatDate(new Date(fechaActual), 'HH:mm:ss', 'en-US')
        this.competencia.hora_inicio = formatDate(new Date(this.competencia.hora_inicio), 'yyyy-MM-dd HH:mm:ss.SSS-05:00', 'en-US');
        this.competencia.hora_final = formatDate(new Date(fechaActual), 'yyyy-MM-dd HH:mm:ss.SSS-05:00', 'en-US');
        this.competencia.estado = 'FINALIZADA';
        this.updateCompetencia(this.competencia)
      }
    });
  }

  async darLlegada(){
    let noAtleta: string = '';
    const { value: no_atleta, isConfirmed } = await Swal.fire({
      title: 'Dar llegada',
      text: `Dar llegada de atleta`,
      input: 'text',
      inputLabel: 'Ingresa el número del atleta',
      inputPlaceholder: "",
      inputValue: noAtleta,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
          if (!value) {
              return 'Debes ingresar el número del atleta'
          }
      }
    });
  
    if (isConfirmed) {
      if (no_atleta) {
        const ateletaFinalizado = this.atletasList.find(item => item.no_atleta === no_atleta);
        if(ateletaFinalizado){
          console.log("ateletaFinalizado", ateletaFinalizado);

          const oleadaIniciada = this.oleadas.find(item => item.no_oleada === ateletaFinalizado.no_oleada);
          console.log("oleadaIniciada", oleadaIniciada);
          
          if(oleadaIniciada){
            if(ateletaFinalizado.estado == 'EN_COMPETENCIA'){
              alertify.set('notifier','position', 'top-right');
              alertify.success('El atleta ' + ateletaFinalizado.no_atleta + " ha finalizado.", 5);
              ateletaFinalizado.estado = 'FINALIZADO';
              ateletaFinalizado.tiempo_competencia = formatDate(new Date(new Date), 'yyyy-MM-dd HH:mm:ss.SSS-05:00', 'en-US')
              console.log("ateletaFinalizado", ateletaFinalizado);
              
              this.asignarTiempoAtleta(ateletaFinalizado)
            }else{
              alertify.set('notifier','position', 'top-right');
              alertify.warning('El atleta ya había finalizado.', 3);
            }
          }else{
            alertify.set('notifier','position', 'top-right');
            alertify.warning('La oleada #' + ateletaFinalizado.no_oleada + " del atleta " + ateletaFinalizado.no_atleta + " no ha sido iniciada!", 4);
          }
          }else{
            alertify.set('notifier','position', 'top-right');
            alertify.warning('Número de atleta no encontrado!', 3);
        }
      }
    }
  }

  updateAtleta(atleta:Atleta){
    console.log("update Atleta");
    console.log("atleta.", atleta)

    this.atletaService.updateAtleta(atleta)
      .subscribe({
        next: (data: any) => {
          console.log("data", data);
          if(data?.response == 'OK'){
            alertify.set('notifier','position', 'top-right');
            alertify.success('Atleta guardado con exito!',2);
          }
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  asignarTiempoAtleta(atleta:Atleta){
    this.atletaService.asignarTiempoAtleta(atleta)
      .subscribe({
        next: (data: any) => {
          console.log("data", data);
          if(data?.response == 'OK'){
            alertify.set('notifier','position', 'top-right');
            alertify.success('Atleta guardado con exito!',2);
          }
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  updateCompetencia(competencia:Competencia){
    console.log("update competencia");
    console.log("competencia.", competencia)

    this.competenciaService.updateCompetencia(competencia)
      .subscribe({
        next: (data: any) => {
          console.log("data", data);
          if(data?.response == 'OK'){
            alertify.set('notifier','position', 'top-right');
            alertify.success('Competencia actualizada con exito!',2);
          }
        },
        error: (err) => {
          // this.showAlert = true;
          // this.alert = {
          //   type   : 'error',
          //   message: `${err.errorDescription}`
          // };
        },
      });
  }

  verGanadores(){
    this.dialog.open(GanadoresDialogComponent, {
      data: {competencia: this.competencia, atletas: this.atletasList},
      width: '95%',
      height: '80%'
    }).afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log("result", result);
          
        }
      });    
  }
}
