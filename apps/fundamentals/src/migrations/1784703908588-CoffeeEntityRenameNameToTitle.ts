import { MigrationInterface, QueryRunner } from "typeorm";

export class CoffeeEntityRenameNameToTitle1784703908588 implements MigrationInterface {
    name = 'CoffeeEntityRenameNameToTitle1784703908588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`);
    }

}
