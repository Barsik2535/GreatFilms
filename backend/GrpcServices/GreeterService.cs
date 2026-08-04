using Grpc.Core;
using TestAPI.Grpc;
namespace TestAPI.GrpcServices
{
    public class GreeterService:Greeter.GreeterBase
    {   
        public override Task<HelloReply> SayHello(HelloRequest request,ServerCallContext context)
        {
            var requestHeaders = context.RequestHeaders;
            foreach (var header in requestHeaders) 
            {
            context.ResponseTrailers.Add(header.Key,header.Value);    
            }
            return Task.FromResult(new HelloReply
            {
                Response = $"Сообщение от {request.Name}: {request.UserMessage}"

            });
            
        }
    }
}
