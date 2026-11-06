import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGithubResource, PaginatedPmbs } from './pmb.type';
import { Pmb } from './pmb.entity';
import { AssignAdminDto, CreatePmbDto, SinglePmbStatsDto, UpdatePmbDto } from './pmb.dto';
import {
  //FilterOperator,
  //FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { User } from '../user/user.entity';
import UtilHelper from '../common/helpers/UtilHelper';
import { UserService } from '../user/user.service';
import Fuse from 'fuse.js';

// https://www.npmjs.com/package/nestjs-paginate
@Injectable()
export class PmbService {
  constructor(
    @InjectRepository(Pmb, 'pmb')
    private readonly pmbRepository: Repository<Pmb>,
    @InjectRepository(User, 'pmb')
    private readonly userRepository: Repository<User>,

    private readonly userService: UserService,
  ) { }

  /**
   * Creates a new Lender (PMB).
   * 
   * @param {CreatePmbDto} createPmbDto - The data transfer object containing details of the new Lender.
   * @returns {Promise<Pmb>} - The newly created Lender entity.
   */
  async create(createPmbDto: CreatePmbDto): Promise<Pmb> {
    return this.pmbRepository.save(createPmbDto);
  }

  /**
   * Retrieves all Lenders (PMBs) from the database.
   * 
   * @returns {Promise<Pmb[]>} - An array of all Lender entities.
   */
  async findAll(): Promise<Pmb[]> {
    return this.pmbRepository.find();
  }


  /**
   * Fetches all staff members associated with a specific Lender (PMB).
   * 
   * This method retrieves all users with a `pmb` role who are employed by the Lender identified by the provided ID.
   * It uses a query builder to fetch users whose `pmb_employer_id` matches the given Lender's ID.
   * 
   * @param {number} id - The ID of the Lender whose staff members are to be fetched.
   * @returns {Promise<User[]>} - A promise resolving to an array of User entities representing the staff members.
   * @throws {NotFoundException} - If a Lender with the given ID is not found.
   */
  async fetchStaff(id: number): Promise<User[]> {
    const pmb = await this.pmbRepository.findOne({
      where: { id },
    });

    if (!pmb) {
      throw new NotFoundException(`${Pmb.name} with ID ${id} not found`);
    }

    return this.userRepository.createQueryBuilder('user')
      .where('user.pmb_employer_id = :pmbEmployerId', { pmbEmployerId: pmb.id })
      .andWhere("JSON_CONTAINS(user.roles, :role)")
      .setParameter('role', JSON.stringify('pmb'))
      .getMany();
  }

  /**
   * Fetches a paginated list of users (customers) who are referees associated with a specified Lender (PMB).
   *
   * @param {number} id - The unique identifier of the Lender (PMB) whose referees are to be fetched.
   * @param {PaginateQuery} query - The pagination and filter query parameters.
   * @returns {Promise<Paginated<User>>} - A paginated response containing the list of referees.
   * @throws {NotFoundException} - If the Lender (PMB) with the specified ID is not found.
   */
  async fetchRefereesPaginated(id: number, query: PaginateQuery): Promise<Paginated<User>> {
    const pmb = await this.pmbRepository.findOne({
      where: { id },
    });

    if (!pmb) {
      throw new NotFoundException(`${Pmb.name} with ID ${id} not found`);
    }

    return this.userService.findAllCustomersByPmbPaginated(id, { ...query, filter: { ...query.filter } });
  }

  /**
   * Fetches all referees (customers) associated with a specified Lender (PMB).
   *
   * @param {number} id - The unique identifier of the Lender (PMB) whose referees are to be fetched.
   * @returns {Promise<User[]>} - An array of users who are referees of the specified Lender.
   * @throws {NotFoundException} - If the Lender (PMB) with the specified ID is not found.
   */
  async fetchReferees(id: number): Promise<User[]> {
    const pmb = await this.pmbRepository.findOne({
      where: { id },
    });

    if (!pmb) {
      throw new NotFoundException(`${Pmb.name} with ID ${id} not found`);
    }

    return this.userRepository.createQueryBuilder('user')
      .where('user.pmb_parent_id = :pmbParentId', { pmbParentId: pmb.id })
      .getMany();
  }

  /**
   * Retrieves the total number of Lenders (PMBs) in the database.
   * 
   * @returns {Promise<number>} - The total count of Lenders.
   */
  async getCount(): Promise<number> {
    return this.pmbRepository.count();
  }

  /**
   * Fetches statistical data for a specific Lender (PMB).
   * 
   * @param {number} id - The unique identifier of the Lender.
   * @returns {Promise<SinglePmbStatsDto>} - An object containing statistical data for the Lender.
   */
  async fetchStats(id: number): Promise<SinglePmbStatsDto> {
    return this.userService.customersMortgageStatsByPmb(id)
  }

  /**
   * Retrieves the names and domains of all listed Lenders (PMBs).
   * 
   * @returns {Promise<Pmb[]>} - An array of objects containing the ID, name, and domain of each listed Lender.
   */
  async findAllNamesOnly(): Promise<Pmb[]> {
    return this.pmbRepository.find(
      {
        select: ['id', 'name', 'domain'],
        where: {
          isListed: true,
        },
      },
    );
  }

  /**
   * Retrieves a Lender (PMB) and its associated user by the User ID.
   * 
   * @param {number} userId - The ID of the user associated with the Lender.
   * @returns {Promise<Pmb>} - The Lender entity with its user relation.
   */
  findOneDeepByUserId(userId: number): Promise<Pmb> {
    return this.pmbRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Toggles the listing status of a Lender (PMB) between active and inactive.
   * 
   * @param {number} id - The ID of the Lender to update.
   * @returns {Promise<Pmb>} - The updated Lender entity.
   * @throws {NotFoundException} - If the Lender with the given ID is not found.
   */
  async toggleListing(id: number): Promise<Pmb> {
    const pmb = await this.pmbRepository.findOneBy({ id });

    if (!pmb) {
      throw new NotFoundException(`Pmb with ID ${id} not found`);
    }

    this.pmbRepository.merge(pmb, {
      isListed: !pmb.isListed
    });
    return this.pmbRepository.save(pmb);
  }

  /**
   * Retrieves a paginated list of Lenders (PMBs) with optional filtering and sorting.
   * 
   * @param {PaginateQuery} query - The pagination and filtering options.
   * @returns {Promise<Paginated<Pmb>>} - The paginated result of Lenders.
   */
  findAllPaginated(query: PaginateQuery): Promise<Paginated<Pmb>> {
    return paginate(query, this.pmbRepository, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name'],
      //select: ['id'],
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        //age: true,
      },
    });
  }

  /**
   * Retrieves a Lender (PMB) by its unique identifier.
   * 
   * @param {number} id - The ID of the Lender.
   * @returns {Promise<Pmb>} - The Lender entity.
   * @throws {NotFoundException} - If the Lender is not found.
   */
  async findOne(id: number): Promise<Pmb> {
    const pmb = this.pmbRepository.findOne({
      where: { id },
    });

    if (!pmb) {
      throw new NotFoundException(`${Pmb.name} with ID ${id} not found`);
    }

    return pmb;
  }

  /**
   * Retrieves a Lender (PMB) by the User ID of an associated user.
   * 
   * @param {number} id - The User ID.
   * @returns {Promise<Pmb>} - The Lender associated with the user.
   */
  async findOneByUser(id: number): Promise<Pmb> {
    const user = await this.userRepository.findOneBy({ id })

    return this.pmbRepository.createQueryBuilder('pmb')
      .where('pmb.id = :pmbEmployerId', { pmbEmployerId: user.pmbEmployerId })
      .getOne();
  }

  /**
   * Updates a Lender (PMB) with new details.
   * 
   * @param {number} id - The ID of the Lender to update.
   * @param {UpdatePmbDto} updatePmbDto - The DTO containing updated details.
   * @returns {Promise<Pmb>} - The updated Lender entity.
   * @throws {NotFoundException} - If the Lender with the specified ID is not found.
   */
  async updateOne(
    id: number,
    updatePmbDto: UpdatePmbDto,
  ): Promise<Pmb> {
    const pmb = await this.pmbRepository.findOneBy({ id });

    if (!pmb) {
      throw new NotFoundException(`Pmb with ID ${id} not found`);
    }

    this.pmbRepository.merge(pmb, updatePmbDto);
    return this.pmbRepository.save(pmb);
  }

  /**
   * Assigns an admin user to a specific Lender (PMB).
   * 
   * @param {AssignAdminDto} dto - The DTO containing the IDs of the Lender and User to assign.
   * @returns {Promise<Pmb>} - The updated Lender entity with the assigned admin.
   * @throws {NotFoundException} - If the Lender or User is not found.
   * @throws {BadRequestException} - If the User's email domain does not match the Lender's domain.
   */
  async assignAdmin(
    dto: AssignAdminDto,
  ): Promise<Pmb> {
    const pmb = await this.pmbRepository.findOneBy({ id: dto.pmbId });
    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!pmb) {
      throw new NotFoundException(`Pmb not found`);
    }

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (!pmb.domain) {
      throw new BadRequestException('Please set the PMB domain');
    }

    if (!UtilHelper.verifyDomain(pmb.domain, user.email)) {
      throw new BadRequestException(`The email domain must be ${pmb.domain}`);
    }

    this.pmbRepository.merge(pmb, {
      admin: {
        id: dto.userId
      }
    });

    return this.pmbRepository.save(pmb);
  }

  /**
   * Retrieves a paginated list of Lenders (PMBs).
   * 
   * @param {number} [page=1] - The page number to retrieve.
   * @param {number} [limit=10] - The maximum number of items per page.
   * @returns {Promise<PaginatedPmbs>} - The paginated result of Lenders.
   */
  async paginate(page: number = 1, limit: number = 10): Promise<PaginatedPmbs> {
    const [users, total] = await this.pmbRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      currentPage: page,
      data: users,
    };
  }

  /**
   * Soft-deletes a Lender (PMB) if it has no active staff or customers.
   * 
   * @param {number} id - The ID of the Lender to delete.
   * @throws {NotFoundException} - If the Lender with the specified ID is not found.
   * @throws {BadRequestException} - If the Lender has active staff or customers.
   */
  async remove(id: number): Promise<void> {
    const pmb = await this.pmbRepository.findOneBy({ id });

    if (!pmb) {
      throw new NotFoundException(`Pmb with ID ${id} not found`);
    }

    const staffCount = await this.userRepository.count({
      where: {
        pmbEmployerId: id,
        suspended: false
      }
    });

    if (staffCount > 0) {
      throw new BadRequestException(`Pmb with ID ${id} has staff`);
    }

    const customerCount = await this.userRepository.count({
      where: {
        pmbParentId: id,
        suspended: false
      }
    });

    if (customerCount > 0) {
      throw new BadRequestException(`Pmb with ID ${id} has customers`);
    }

    await this.pmbRepository.softDelete(id);
  }

  /**
   * Restores a soft-deleted Lender (PMB).
   * 
   * @param {number} id - The ID of the Lender to restore.
   * @returns {Promise<Pmb>} - The restored Lender entity.
   * @throws {NotFoundException} - If the Lender with the specified ID is not found.
   */
  async restore(
    id: number
  ): Promise<Pmb> {
    const pmb = await this.pmbRepository.findOne({
      where: { id },
      withDeleted: true
    });

    if (!pmb) {
      throw new NotFoundException(`Pmb with ID ${id} not found`);
    }

    this.pmbRepository.merge(pmb, { deletedAt: null });
    return this.pmbRepository.save(pmb);
  }

  async getFolder(businessName: string, folders: IGithubResource[]) {
    const fuse = new Fuse(folders.map(folder => folder.name), { includeScore: true, threshold: 0.4 });
    const bestMatch = fuse.search(businessName)?.[0];

    if (bestMatch.score > 0.3) {
      return null
    }

    return bestMatch?.item || null;
  }

  async getLogo(name: string): Promise<string | null> {
    const foldersUrl = 'https://api.github.com/repos/PaystackHQ/nigerialogos/contents/logos'

    try {
      const response = await fetch(foldersUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const folders: IGithubResource[] = await response.json();
      const folderName = await this.getFolder(name, folders);
      console.log({ folderName })
      if (!folderName) {
        return null
      }

      const logoUrl = `https://api.github.com/repos/PaystackHQ/nigerialogos/contents/logos/${folderName}/${folderName}.svg`;
      const logoResponse = await fetch(logoUrl);

      if (!logoResponse.ok) {
        throw new Error('Failed to fetch logo');
      }

      const logo: IGithubResource = await logoResponse.json();
      return logo.download_url
    } catch (err) {
      console.log(err)
      throw new BadRequestException('Error fetching logo');
    }
  }
}
