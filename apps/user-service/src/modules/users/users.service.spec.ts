import { UsersService } from "./users.service";

describe("UsersService (unit)", () => {
  it("should normalize emails to lowercase on create", async () => {
    const prisma: any = {
      user: {
        create: jest.fn().mockResolvedValue({ id: "1", email: "a@b.com", username: "u" }),
      },
    };
    const service = new UsersService(prisma);

    await service.create({ username: "u", email: "A@B.COM" } as any);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "a@b.com" }),
      }),
    );
  });
});
