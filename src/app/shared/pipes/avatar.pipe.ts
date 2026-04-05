import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Persona } from '../../admin-dashboard/interfaces/persona.interface';

@Pipe({
  name: 'avatar',
  standalone: true
})
export class AvatarPipe implements PipeTransform {

  transform(persona: Persona | null | undefined): string {
    if (!persona) return '/avatar/men-default.jpeg';
    
    // Si la persona tiene imagen subida
    if (persona.img && persona.img.trim() !== '') {
      return `${environment.baseUrl}/profile/${persona.img}`;
    }

    // Si NO tiene imagen, usamos las fotos predeterminadas public/avatar según el sexo
    if (persona.sexo === 'F') {
      return '/avatar/woman-default.jpeg';
    } else {
      return '/avatar/men-default.jpeg';
    }
  }

}
