import { InternalServerErrorException } from "@nestjs/common";
import { User } from "src/auth/user.entity";
import { EntityRepository, Repository } from "typeorm";
import { CreateTaskDTO } from "./dto/create-task-dto";
import { getTaskFilterDTO } from "./dto/get-tasks-filter.dto";
import { TaskStatus } from "./tasks-status.enum";
import { Task } from "./tasks.entity";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    async getTasks(
        filterDTO: getTaskFilterDTO,
        user: User
        ): Promise<Task[]> {
        const { status, search } = filterDTO;

        // Adding a keyword "task" that will be used in my query building
        const query = this.createQueryBuilder('task');

        query.where('task.userId = :userId', { userId: user.id });

        if(status) {
            query.andWhere('task.status = :status', { status })
        }

        if(search) {
            query.andWhere('task.title LIKE :search OR task.description LIKE :search', { search: `%${search}%`});
        }

        try {
            const tasks = await query.getMany()
            return tasks; 
        } catch (err) {
            throw new InternalServerErrorException(err);
            
        }
       
    }

    async createTask(
         createTaskDTO: CreateTaskDTO,
         user: User,
            ): Promise<Task> {
        const { title, description } = createTaskDTO;

        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;

        try {
            await task.save();
         } catch (err) {
            throw new InternalServerErrorException(); 
         }
 
         delete task.user;
         return task;
    }
}