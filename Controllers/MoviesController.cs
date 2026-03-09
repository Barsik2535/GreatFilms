using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAPI.Data;
using TestAPI.Models;

namespace TestAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MoviesController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] Movie movie)//привязка к модели, данные из запроса десереализуются в тип Movie
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById),new {Id=movie.Id},movie);
        }
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> Edit([FromBody] Movie movie,int id)//добавляем id по которому находим обьект и присваиваем поля из запроса
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var newData = await _context.Movies.FindAsync(id);
            if (newData == null)
            {
                return NotFound();
            }
            newData.Title= movie.Title;
            newData.Description= movie.Description;
            newData.ReleaseYear= movie.ReleaseYear;
            
            await _context.SaveChangesAsync();
            return Ok(newData);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {   //получаем по убыванию
            var movies = await _context.Movies.OrderByDescending(n => n.ReleaseYear).ToListAsync();

            return Ok(movies);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {   //получаем id и находим по нему
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
                return NotFound();

            return Ok(movie);   
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteFilm(int id)
        {
            var movie= await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return Ok();
        }   
    } 
}
