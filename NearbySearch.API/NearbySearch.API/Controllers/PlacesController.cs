using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Newtonsoft.Json;
using NearbySearch.API.Model;
using Microsoft.Extensions.Options;

namespace NearbySearch.API.Controllers
{
    [Produces("application/json")]
    [Route("api/Places")]
    public class PlacesController : Controller
    {


        private readonly IOptions<NearbySearchApiConfig> config;

        public PlacesController(IOptions<NearbySearchApiConfig> config)
        {
            this.config = config;
        }

        /// </summary>
        /// <param name="location">The latitude/longitude around which to retrieve place information. This must be specified as latitude,longitude./default loc> Edinburgh.</param>
        /// <param name="radius">Defines the distance (in meters) within which to return place results</param>
        /// <param name="types">Restricts the results to places matching the specified type. Only one type may be specified (if more than one type is provided, all types following the first entry are ignored). See the list of supported types:https://developers.google.com/places/web-service/supported_types</param>
        /// <param name="name">keyword — A term to be matched against all content that Google has indexed for this place, including but not limited to name, type, and address, as well as customer reviews and other third-party content.</param>
        /// <returns></returns>
        [HttpGet("GetNearbySearch")]
        public async Task<string> GetNearbySearch([FromQuery]string location = "55.949868, -3.189642", [FromQuery]int radius = 1000, [FromQuery]string types = "",
             [FromQuery]string keyword = "", [FromQuery]string pagetoken = "")
        {
            var response = new HttpResponseMessage();
            using (var client = new HttpClient())
            {
                var YOUR_API_KEY = config.Value.Key; //"AIzaSyC1YeRpY2nXj9KBtRJZ6GieeOrUryn4rno";
                try
                {
                    client.BaseAddress = new Uri(config.Value.MainUrl);

                    //https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670,151.1957&radius=500&types=food&name=cruise&key=AIzaSyC1YeRpY2nXj9KBtRJZ6GieeOrUryn4rno

                     response = await client.GetAsync($"/maps/api/place/nearbysearch/json?location={location}&radius={radius}&types={types}&keyword={keyword}&pagetoken={pagetoken}&key={YOUR_API_KEY}");
                    response.EnsureSuccessStatusCode();

                    var stringResult = await response.Content.ReadAsStringAsync();
                 
                    return stringResult;
                }
                catch (HttpRequestException httpRequestException)
                {
                    throw new HttpRequestException($"Error getting data from googleapis: {httpRequestException.Message}");
                }
            }
        }


    }
}