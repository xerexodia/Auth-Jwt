CREATE TABLE [User] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [Mail] nvarchar(255) UNIQUE,
  [Password] nvarchar(255),
  [InsertDate] datetime DEFAULT GETDATE(),
  [UpdatedDate] datetime DEFAULT GETDATE(),
)

GO

CREATE TABLE [Login] (
  [Id] int PRIMARY KEY IDENTITY(1, 1),
  [User_Id] int,
  [RefreshToken] nvarchar(255),
  [InsertDate] datetime DEFAULT GETDATE(),
  [UpdatedDate] datetime DEFAULT GETDATE()
)
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Used as login_Id',
@level0type = N'Schema', @level0name = 'auth',
@level1type = N'Table',  @level1name = 'User',
@level2type = N'Column', @level2name = 'Mail';

GO

ALTER TABLE [Login] ADD FOREIGN KEY ([User_Id]) REFERENCES [User] ([Id])
GO

