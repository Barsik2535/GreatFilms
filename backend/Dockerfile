FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["TestAPI.csproj", "./"]
RUN dotnet restore "TestAPI.csproj"
COPY . .
RUN dotnet publish "TestAPI.csproj" -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5108
ENV ASPNETCORE_URLS=http://+:5108
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TestAPI.dll"]